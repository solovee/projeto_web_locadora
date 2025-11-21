from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import (
    AtorViewSet, CidadeViewSet, ClassificacaoEtariaViewSet,
    ClassificacaoInternaViewSet, ClienteViewSet, EstadoViewSet, TipoViewSet,
    GeneroViewSet, ExemplarViewSet, MidiaViewSet, LocacaoViewSet,
    ItemLocacaoListCreateAPIView, ItemLocacaoDetailAPIView
)

router = DefaultRouter()
router.register(r'atores', AtorViewSet)
router.register(r'cidades', CidadeViewSet)
router.register(r'classificacoes_etarias', ClassificacaoEtariaViewSet)
router.register(r'classificacoes_internas', ClassificacaoInternaViewSet)
router.register(r'clientes', ClienteViewSet)
router.register(r'estados', EstadoViewSet)
router.register(r'tipos', TipoViewSet)
router.register(r'generos', GeneroViewSet)
router.register(r'exemplares', ExemplarViewSet)
router.register(r'midias', MidiaViewSet)
router.register(r'locacoes', LocacaoViewSet)

urlpatterns = [
    # Templates
    path('atores/', views.ator_list, name='atores'),
    path('', views.home, name='home'),

    # API do router
    path('api/', include(router.urls)),

    # Templates adicionais
    path('cidades/', views.cidade_list, name='cidades'),
    path('clientes/', views.cliente_list, name='clientes'),
    path('estados/', views.estado_list, name='estados'),
    path('midias/', views.midia_list, name='midias'),
    path('locacoes/', views.locacao_list, name='locacoes'),
    path('classificacoes_etarias/', views.classificacao_etaria_list, name='classificacoes_etarias'),
    path('classificacoes_internas/', views.classificacao_interna_list, name='classificacoes_internas'),
    path('exemplares/', views.exemplar_list, name='exemplares'),
    path('generos/', views.genero_list, name='generos'),
    path('tipos/', views.tipo_list, name='tipos'),

    # Página HTML de ItemLocacoes
    path("item_locacoes_page/", views.item_locacao_list, name="item_locacoes_page"),

    # === ROTAS DA OPÇÃO A (API MANUAL, composite key) ===
    path("api/item_locacoes/", ItemLocacaoListCreateAPIView.as_view(), name="itemlocacao-listcreate"),
    path("api/item_locacoes/<int:locacao>/<int:exemplar>/", ItemLocacaoDetailAPIView.as_view(), name="itemlocacao-detail"),
]
