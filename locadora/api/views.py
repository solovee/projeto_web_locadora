from django.shortcuts import get_object_or_404, render

# Create your views here.
from django.shortcuts import render
from .models import Ator, Cidade, ClassificacaoEtaria, ClassificacaoInterna, Cliente, Exemplar, Genero, Midia, Locacao, Estado, Tipo, ItemLocacao

# SeuApp/views.py (ou api_views.py)

from rest_framework import viewsets
from .serializers import AtorSerializer, CidadeSerializer, ClassificacaoEtariaSerializer, ClassificacaoInternaSerializer, ClienteSerializer, EstadoSerializer, ExemplarSerializer, GeneroSerializer, LocacaoSerializer, MidiaSerializer, TipoSerializer, ItemLocacaoSerializer

# Esta Viewset fornece os endpoints: GET (lista e detalhe), POST, PUT/PATCH, DELETE
class AtorViewSet(viewsets.ModelViewSet):
    queryset = Ator.objects.all()
    serializer_class = AtorSerializer


class CidadeViewSet(viewsets.ModelViewSet):
    queryset = Cidade.objects.all()
    # Você precisará criar um serializer para Cidade similar ao AtorSerializer
    serializer_class = CidadeSerializer

class ClassificacaoEtariaViewSet(viewsets.ModelViewSet):
    queryset = ClassificacaoEtaria.objects.all()
    # Você precisará criar um serializer para ClassificacaoEtaria similar ao AtorSerializer
    serializer_class = ClassificacaoEtariaSerializer

class ClassificacaoInternaViewSet(viewsets.ModelViewSet):
    queryset = ClassificacaoInterna.objects.all()
    # Você precisará criar um serializer para ClassificacaoInterna similar ao AtorSerializer
    serializer_class = ClassificacaoInternaSerializer

class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    # Você precisará criar um serializer para Cliente similar ao AtorSerializer
    serializer_class = ClienteSerializer
class EstadoViewSet(viewsets.ModelViewSet):
    queryset = Estado.objects.all()
    # Você precisará criar um serializer para Estado similar ao AtorSerializer
    serializer_class = EstadoSerializer

class TipoViewSet(viewsets.ModelViewSet):
    queryset = Tipo.objects.all()
    # Você precisará criar um serializer para Tipo similar ao AtorSerializer
    serializer_class = TipoSerializer

class GeneroViewSet(viewsets.ModelViewSet):
    queryset = Genero.objects.all()
    # Você precisará criar um serializer para Genero similar ao AtorSerializer
    serializer_class = GeneroSerializer

class ExemplarViewSet(viewsets.ModelViewSet):
    queryset = Exemplar.objects.all()
    # Você precisará criar um serializer para Exemplar similar ao AtorSerializer
    serializer_class = ExemplarSerializer


class MidiaViewSet(viewsets.ModelViewSet):
    queryset = Midia.objects.all()
    # Você precisará criar um serializer para Midia similar ao AtorSerializer
    serializer_class = MidiaSerializer

class LocacaoViewSet(viewsets.ModelViewSet):
    queryset = Locacao.objects.all()
    # Você precisará criar um serializer para Locacao similar ao AtorSerializer
    serializer_class = LocacaoSerializer

class ItemLocacaoViewSet(viewsets.ModelViewSet):
    serializer_class = ItemLocacaoSerializer
    queryset = ItemLocacao.objects.all()
    lookup_field = None  # ignorar lookup padrão

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
# api/views.py

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


# ... mantenha suas outras views

def ator_list(request):
    # Não precisa mais de Ator.objects.all()
    return render(request, 'ator.html') # Não passe mais o contexto 'atores'

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


