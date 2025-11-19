# SeuApp/serializers.py

from rest_framework import serializers
from .models import Ator

class AtorSerializer(serializers.ModelSerializer):
    # Formata a data de estreia para o formato YYYY-MM-DD para compatibilidade com o input type="date"
    data_estreia = serializers.DateField(format="%Y-%m-%d")

    class Meta:
        model = Ator
        fields = ['id', 'nome', 'sobrenome', 'data_estreia']