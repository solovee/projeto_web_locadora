"""
URL configuration for locadora project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from . import views
from django.contrib import admin
from django.urls import path

urlpatterns = [
    path('atores/', views.ator_list, name='atores'),
    path('cidades/', views.cidade_list, name='cidades'),
    path('clientes/', views.cliente_list, name='clientes'),
    path('estados/', views.estado_list, name='estados'),
    path('midias/', views.midia_list, name='midias'),
    path('locacoes/', views.locacao_list, name='locacoes'),
    path('classificacoes_etarias/', views.classificacao_etaria_list, name='classificacoes_etarias'),
    path('classificacoes_internas/', views.classificacao_interna_list, name='classificacoes_internas'),
    path('exemplares/', views.exemplar_list, name='exemplares'),
    path('generos/', views.genero_list, name='generos'),
    path('tipos/', views.tipo_list, name='tipos')
]
