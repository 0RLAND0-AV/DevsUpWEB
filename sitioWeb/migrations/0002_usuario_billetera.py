# Generated by Django 5.1.1 on 2024-10-24 16:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sitioWeb', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='usuario',
            name='billetera',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
    ]
