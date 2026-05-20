from django.contrib import admin
from .models import Patient, Token

admin.site.register(Patient)
admin.site.register(Token)