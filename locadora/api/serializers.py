from rest_framework import serializers
from .models import Ator, Cidade, ClassificacaoEtaria, ClassificacaoInterna, Cliente, Estado, Exemplar, Genero, Locacao, Midia, Tipo, ItemLocacao
from django.db.models import Sum

class AtorSerializer(serializers.ModelSerializer):
    data_estreia = serializers.DateField(format="%Y-%m-%d")

    class Meta:
        model = Ator
        fields = '__all__'

class CidadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cidade
        fields = '__all__'


class ClassificacaoEtariaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassificacaoEtaria
        fields = '__all__'

class ClassificacaoInternaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassificacaoInterna
        fields = '__all__'

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
        read_only_fields = ['valor']  


class LocacaoFullSerializer(serializers.ModelSerializer):
    exemplares_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True, 
        required=True
    )
    
    exemplares_list = serializers.SerializerMethodField()
    
    valor_total = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)

    class Meta:
        model = Locacao
        fields = ['id', 'data_inicio', 'data_fim', 'cancelada', 'cliente', 'exemplares_ids', 'exemplares_list', 'valor_total']
        read_only_fields = ['id', 'valor_total', 'exemplares_list'] 
    
    def get_exemplares_list(self, obj):
        itens = ItemLocacao.objects.filter(locacao=obj)
        exemplares_codigos = [item.exemplar_codigo_interno.codigo_interno for item in itens]
        return ", ".join(map(str, exemplares_codigos))

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        total = ItemLocacao.objects.filter(locacao=instance).aggregate(Sum('valor'))['valor__sum']
        representation['valor_total'] = total if total is not None else 0.00
        return representation