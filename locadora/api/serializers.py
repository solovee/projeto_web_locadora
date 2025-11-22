# SeuApp/serializers.py

from rest_framework import serializers
from .models import Ator, Cidade, ClassificacaoEtaria, ClassificacaoInterna, Cliente, Estado, Exemplar, Genero, Locacao, Midia, Tipo, ItemLocacao
from django.db.models import Sum

class AtorSerializer(serializers.ModelSerializer):
    # Formata a data de estreia para o formato YYYY-MM-DD para compatibilidade com o input type="date"
    data_estreia = serializers.DateField(format="%Y-%m-%d")

    class Meta:
        model = Ator
        fields = ['id', 'nome', 'sobrenome', 'data_estreia']

class CidadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cidade
        fields = ['id', 'nome', 'estado']


class ClassificacaoEtariaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassificacaoEtaria
        fields = ['id', 'descricao']

class ClassificacaoInternaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassificacaoInterna
        fields = ['id', 'descricao', 'valor_aluguel']

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'

class EstadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estado
        fields = '__all__'

class TipoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tipo
        fields = '__all__'

class GeneroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genero
        fields = '__all__'

class ExemplarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exemplar
        fields = '__all__'

class MidiaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Midia
        fields = '__all__'

class LocacaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Locacao
        fields = '__all__'

class ItemLocacaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemLocacao
        fields = ['locacao', 'exemplar_codigo_interno', 'valor']
        read_only_fields = ['valor']  # usuário NÃO envia

# SeuApp/serializers.py

# ... (mantenha os serializers existentes, como LocacaoSerializer, ItemLocacaoSerializer, etc.)

class LocacaoFullSerializer(serializers.ModelSerializer):
    # Campo para receber a lista de IDs de exemplares na criação
    exemplares_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True, 
        required=True
    )
    
    # Campo para listar os exemplares associados na saída (GET)
    exemplares_list = serializers.SerializerMethodField()
    
    # Campo para o valor total (calculado na saída)
    valor_total = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)

    class Meta:
        model = Locacao
        fields = ['id', 'data_inicio', 'data_fim', 'cancelada', 'cliente', 'exemplares_ids', 'exemplares_list', 'valor_total']
        read_only_fields = ['id', 'valor_total', 'exemplares_list'] 
    
    def get_exemplares_list(self, obj):
        # ... (Função para formatar a lista de IDs dos exemplares)
        itens = ItemLocacao.objects.filter(locacao=obj)
        exemplares_codigos = [item.exemplar_codigo_interno.codigo_interno for item in itens]
        return ", ".join(map(str, exemplares_codigos))

    def to_representation(self, instance):
        # ... (Função para calcular o valor total na saída)
        representation = super().to_representation(instance)
        total = ItemLocacao.objects.filter(locacao=instance).aggregate(Sum('valor'))['valor__sum']
        representation['valor_total'] = total if total is not None else 0.00
        return representation