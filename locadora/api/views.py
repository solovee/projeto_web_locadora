from django.shortcuts import get_object_or_404, render

from django.shortcuts import render
from .models import Ator, Cidade, ClassificacaoEtaria, ClassificacaoInterna, Cliente, Exemplar, Genero, Midia, Locacao, Estado, Tipo, ItemLocacao


from rest_framework import viewsets
from .serializers import AtorSerializer, CidadeSerializer, ClassificacaoEtariaSerializer, ClassificacaoInternaSerializer, ClienteSerializer, EstadoSerializer, ExemplarSerializer, GeneroSerializer, LocacaoSerializer, MidiaSerializer, TipoSerializer, ItemLocacaoSerializer

class AtorViewSet(viewsets.ModelViewSet):
    queryset = Ator.objects.all()
    serializer_class = AtorSerializer


class CidadeViewSet(viewsets.ModelViewSet):
    queryset = Cidade.objects.all()
    serializer_class = CidadeSerializer

class ClassificacaoEtariaViewSet(viewsets.ModelViewSet):
    queryset = ClassificacaoEtaria.objects.all()
    serializer_class = ClassificacaoEtariaSerializer

class ClassificacaoInternaViewSet(viewsets.ModelViewSet):
    queryset = ClassificacaoInterna.objects.all()
    serializer_class = ClassificacaoInternaSerializer

class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer

class EstadoViewSet(viewsets.ModelViewSet):
    queryset = Estado.objects.all()
    serializer_class = EstadoSerializer

class TipoViewSet(viewsets.ModelViewSet):
    queryset = Tipo.objects.all()
    serializer_class = TipoSerializer

class GeneroViewSet(viewsets.ModelViewSet):
    queryset = Genero.objects.all()
    serializer_class = GeneroSerializer

class ExemplarViewSet(viewsets.ModelViewSet):
    queryset = Exemplar.objects.all()
    serializer_class = ExemplarSerializer


class MidiaViewSet(viewsets.ModelViewSet):
    queryset = Midia.objects.all()
    serializer_class = MidiaSerializer

class LocacaoViewSet(viewsets.ModelViewSet):
    queryset = Locacao.objects.all()
    serializer_class = LocacaoSerializer

class ItemLocacaoViewSet(viewsets.ModelViewSet):
    serializer_class = ItemLocacaoSerializer
    queryset = ItemLocacao.objects.all()
    lookup_field = None 

    def get_object(self):
        locacao = self.kwargs.get("locacao")
        exemplar = self.kwargs.get("exemplar")

        return get_object_or_404(
            ItemLocacao,
            locacao_id=locacao,
            exemplar_codigo_interno=exemplar
        )

    def perform_create(self, serializer):
        exemplar = Exemplar.objects.get(
            codigo_interno=self.request.data["exemplar_codigo_interno"]
        )

        midia = exemplar.midia
        classificacao = midia.classificacao_interna
        valor = classificacao.valor_aluguel

        serializer.save(valor=valor)

from rest_framework import generics
from django.shortcuts import get_object_or_404
from .models import ItemLocacao, Exemplar
from .serializers import ItemLocacaoSerializer

class ItemLocacaoListCreateAPIView(generics.ListCreateAPIView):
    queryset = ItemLocacao.objects.all()
    serializer_class = ItemLocacaoSerializer

    def perform_create(self, serializer):
        exemplar = Exemplar.objects.get(
            codigo_interno=self.request.data["exemplar_codigo_interno"]
        )

        midia = exemplar.midia
        classificacao = midia.classificacao_interna
        valor = classificacao.valor_aluguel

        serializer.save(valor=valor)


class ItemLocacaoDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ItemLocacaoSerializer

    def get_object(self):
        locacao = self.kwargs.get("locacao")
        exemplar = self.kwargs.get("exemplar")

        return get_object_or_404(
            ItemLocacao,
            locacao_id=locacao,
            exemplar_codigo_interno=exemplar
        )
    
    # SeuApp/views.py

from django.db import transaction
from django.db.models import Sum
from rest_framework import generics
from rest_framework.exceptions import ValidationError
from .models import ItemLocacao, Exemplar, Locacao, ClassificacaoInterna, Midia
from .serializers import LocacaoFullSerializer 


class LocacaoFullListCreateAPIView(generics.ListCreateAPIView):
    queryset = Locacao.objects.all().order_by('-id')
    serializer_class = LocacaoFullSerializer

    def perform_create(self, serializer):
        
        exemplares_ids = serializer.validated_data.pop('exemplares_ids')
        
        if not exemplares_ids:
            raise ValidationError({"exemplares_ids": "Deve haver pelo menos um exemplar."})
            
        exemplares_para_alugar = Exemplar.objects.select_related('midia__classificacao_interna').filter(
            codigo_interno__in=exemplares_ids
        )
        
        if exemplares_para_alugar.count() != len(set(exemplares_ids)):
            raise ValidationError({"exemplares_ids": "Um ou mais Exemplares não foram encontrados."})
            
        if any(e.disponivel <= 0 for e in exemplares_para_alugar):
             raise ValidationError({"exemplares_ids": "Um ou mais Exemplares não estão disponíveis (estoque 0)."})

        try:
            with transaction.atomic():
                locacao = serializer.save()

                for exemplar in exemplares_para_alugar:
                    valor_aluguel = exemplar.midia.classificacao_interna.valor_aluguel
                    
                    ItemLocacao.objects.create(
                        locacao=locacao,
                        exemplar_codigo_interno=exemplar,
                        valor=valor_aluguel
                    )
                    
                    exemplar.disponivel -= 1
                    exemplar.save()

        except Exception as e:
            raise ValidationError({"detalhe": f"Erro na criação da locação e itens: {e}"})

class LocacaoFullDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Locacao.objects.all()
    serializer_class = LocacaoFullSerializer
    lookup_field = 'id' 

    def perform_update(self, serializer):
        """
        Permite apenas a edição do campo 'cancelada'.
        Se 'cancelada' mudar para 1, reverte o estoque dos exemplares.
        """
        
        locacao_atual = self.get_object()
        dados_novos = serializer.validated_data
        
        campos_permitidos = {'cancelada', 'id'} 
        campos_enviados = set(dados_novos.keys())
        
        campos_nao_permitidos = campos_enviados - campos_permitidos
        
        if 'id' in campos_nao_permitidos: campos_nao_permitidos.remove('id')
        if 'cliente' in campos_nao_permitidos: campos_nao_permitidos.remove('cliente')

        if len(campos_nao_permitidos) > 0:
            raise ValidationError({"detalhe": f"Somente o campo 'cancelada' pode ser alterado via PUT/PATCH. Campos não permitidos: {list(campos_nao_permitidos)}"})

        nova_cancelada = dados_novos.get('cancelada')
        
        if nova_cancelada is not None and int(nova_cancelada) == 1 and locacao_atual.cancelada == 0:
            
            exemplares_na_locacao = Exemplar.objects.filter(itemlocacao__locacao=locacao_atual)
            
            with transaction.atomic():
                locacao = serializer.save()
                
                for exemplar in exemplares_na_locacao:
                    exemplar.disponivel += 1
                    exemplar.save()
                    
        elif nova_cancelada is not None and int(nova_cancelada) == 0 and locacao_atual.cancelada == 1:
            exemplares_na_locacao = Exemplar.objects.filter(itemlocacao__locacao=locacao_atual)

            if any(e.disponivel <= 0 for e in exemplares_na_locacao):
                raise ValidationError({"cancelada": "Não é possível reativar esta locação pois um ou mais exemplares não estão mais disponíveis no estoque."})
            
            with transaction.atomic():
                locacao = serializer.save()
                
                for exemplar in exemplares_na_locacao:
                    exemplar.disponivel -= 1
                    exemplar.save()
                    
        else:
            serializer.save()

def locacao_full_list(request):
    """ Renderiza a página principal para gerenciar Locações e ItemLocações. """
    return render(request, 'locacoes_full.html')



def ator_list(request):
    return render(request, 'ator.html') 

def cliente_list(request):
    return render(request, 'cliente.html')  
def midia_list(request):
    return render(request, 'midia.html')

def locacao_list(request):
    return render(request, 'locacao.html')

def classificacao_etaria_list(request):
    return render(request, 'classificacao_etaria.html')

def classificacao_interna_list(request):
    return render(request, 'classificacao_interna.html')

def estado_list(request):
    return render(request, 'estado.html')

def cidade_list(request):
    return render(request, 'cidade.html')

def exemplar_list(request):
    return render(request, 'exemplar.html')

def genero_list(request):
    return render(request, 'genero.html')

def locacoes_list(request):
    return render(request, 'locacoes.html')

def tipo_list(request):
    return render(request, 'tipo.html')

def midia_list(request):
    return render(request, 'midia.html')

def item_locacao_list(request):
    return render(request, 'item_locacao.html')

def home(request):
    return render(request, 'index.html')


