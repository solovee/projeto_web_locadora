from django.db import models

class Ator(models.Model):
    nome = models.CharField(max_length=45)
    sobrenome = models.CharField(max_length=45)
    data_estreia = models.DateField()

    class Meta:
        managed = False
        db_table = 'ator'


class Cidade(models.Model):
    nome = models.CharField(max_length=30)
    estado = models.ForeignKey('Estado', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'cidade'


class ClassificacaoEtaria(models.Model):
    descricao = models.CharField(max_length=45)

    class Meta:
        managed = False
        db_table = 'classificacao_etaria'


class ClassificacaoInterna(models.Model):
    descricao = models.CharField(max_length=45)
    valor_aluguel = models.DecimalField(max_digits=15, decimal_places=2)

    class Meta:
        managed = False
        db_table = 'classificacao_interna'


class Cliente(models.Model):
    nome = models.CharField(max_length=45)
    sobrenome = models.CharField(max_length=45)
    data_nascimento = models.DateField()
    cpf = models.CharField(unique=True, max_length=14)
    email = models.CharField(max_length=60)
    logradouro = models.CharField(max_length=50)
    numero = models.CharField(max_length=6)
    bairro = models.CharField(max_length=30)
    cep = models.CharField(max_length=9)
    cidade = models.ForeignKey('Cidade', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'cliente'


class Estado(models.Model):
    nome = models.CharField(max_length=30)
    sigla = models.CharField(unique=True, max_length=2)

    class Meta:
        managed = False
        db_table = 'estado'


class Exemplar(models.Model):
    codigo_interno = models.AutoField(primary_key=True)
    disponivel = models.IntegerField()
    midia = models.ForeignKey('Midia', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'exemplar'


class Genero(models.Model):
    descricao = models.CharField(max_length=45)

    class Meta:
        managed = False
        db_table = 'genero'


class Locacao(models.Model):
    data_inicio = models.DateField()
    data_fim = models.DateField()
    cancelada = models.IntegerField()
    cliente = models.ForeignKey('Cliente', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'locacao'
class ItemLocacao(models.Model):   
    pk = models.CompositePrimaryKey('locacao_id', 'exemplar_codigo_interno') 
    locacao = models.ForeignKey('Locacao', models.DO_NOTHING) 
    exemplar_codigo_interno = models.ForeignKey(Exemplar, models.DO_NOTHING, db_column='exemplar_codigo_interno')
    valor = models.DecimalField(max_digits=15, decimal_places=2)
    class Meta:
        managed = False
        db_table = 'item_locacao'


class Midia(models.Model):
    titulo = models.CharField(max_length=100)
    ano_lancamento = models.IntegerField()
    codigo_barras = models.CharField(unique=True, max_length=13)
    duracao_em_minutos = models.IntegerField()
    ator_principal = models.ForeignKey('Ator', models.DO_NOTHING, db_column='ator_principal')
    ator_coadjuvante = models.ForeignKey('Ator', models.DO_NOTHING, db_column='ator_coadjuvante', related_name='midia_ator_coadjuvante_set')
    genero = models.ForeignKey('Genero', models.DO_NOTHING)
    classificacao_etaria = models.ForeignKey('ClassificacaoEtaria', models.DO_NOTHING)
    tipo = models.ForeignKey('Tipo', models.DO_NOTHING)
    classificacao_interna = models.ForeignKey('ClassificacaoInterna', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'midia'


class Tipo(models.Model):
    descricao = models.CharField(max_length=45)

    class Meta:
        managed = False
        db_table = 'tipo'
