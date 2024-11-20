# Generated by Django 5.1.1 on 2024-11-18 11:48

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sitioWeb', '0006_configuracionlogo_fecha_creacion'),
    ]

    operations = [
        migrations.CreateModel(
            name='PersonalizarColores',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('primario', models.CharField(max_length=7)),
                ('secundario', models.CharField(max_length=7)),
                ('terciario', models.CharField(max_length=7)),
                ('texto', models.CharField(max_length=7)),
                ('fondo', models.CharField(max_length=7)),
                ('usuario', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='sitioWeb.usuario')),
            ],
            options={
                'verbose_name': 'Personalizar Color',
                'verbose_name_plural': 'Personalizar Colores',
                'db_table': 'PersonalizarColores',
            },
        ),
    ]
