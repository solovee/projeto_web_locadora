# SeuApp/serializers.py

from rest_framework import serializers
from .models import Ator, Cidade, ClassificacaoEtaria, ClassificacaoInterna, Cliente, Estado, Exemplar, Genero, Locacao, Midia, Tipo

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