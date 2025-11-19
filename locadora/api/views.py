from django.shortcuts import render

# Create your views here.
from django.shortcuts import render
from .models import Ator, Cidade, ClassificacaoEtaria, ClassificacaoInterna, Cliente, Exemplar, Genero, Midia, Locacao, Estado, Tipo

# SeuApp/views.py (ou api_views.py)

from rest_framework import viewsets
from .models import Ator
from .serializers import AtorSerializer

# Esta Viewset fornece os endpoints: GET (lista e detalhe), POST, PUT/PATCH, DELETE
class AtorViewSet(viewsets.ModelViewSet):
    queryset = Ator.objects.all()
    serializer_class = AtorSerializer

# ... mantenha suas outras views

def ator_list(request):
    # Não precisa mais de Ator.objects.all()
    return render(request, 'ator.html', {}) # Não passe mais o contexto 'atores'

def cliente_list(request):
    clientes = Cliente.objects.all()
    return render(request, 'cliente.html', {'clientes': clientes})  
def midia_list(request):
    midias = Midia.objects.all()
    return render(request, 'midia.html', {'midias': midias})

def locacao_list(request):
    locacoes = Locacao.objects.all()
    return render(request, 'locacao.html', {'locacoes': locacoes})

def classificacao_etaria_list(request):
    classificacoes = ClassificacaoEtaria.objects.all()
    return render(request, 'classificacao_etaria.html', {'classificacoes': classificacoes})

def classificacao_interna_list(request):
    classificacoes_internas = ClassificacaoInterna.objects.all()
    return render(request, 'classificacao_interna.html', {'classificacoes_internas': classificacoes_internas})

def estado_list(request):
    estados = Estado.objects.all()
    return render(request, 'estado.html', {'estados': estados})

def cidade_list(request):
    cidades = Cidade.objects.all()
    return render(request, 'cidade.html', {'cidades': cidades})

def exemplar_list(request):
    exemplares = Exemplar.objects.all()
    return render(request, 'exemplar.html', {'exemplares': exemplares})

def genero_list(request):
    generos = Genero.objects.all()
    return render(request, 'genero.html', {'generos': generos})

def locacoes_list(request):
    locacoes = Locacao.objects.all()
    return render(request, 'locacoes.html', {'locacoes': locacoes})

def tipo_list(request):
    tipos = Tipo.objects.all()
    return render(request, 'tipo.html', {'tipos': tipos})

def midia_list(request):
    midias = Midia.objects.all()
    return render(request, 'midia.html', {'midias': midias})

def home(request):
    return render(request, 'index.html')


