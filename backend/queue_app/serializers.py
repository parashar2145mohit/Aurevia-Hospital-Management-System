from rest_framework import serializers
from .models import Patient, Token

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = "__all__"

class TokenSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source="patient.name", read_only=True)
    patient_age = serializers.IntegerField(source="patient.age", read_only=True)
    patient_type = serializers.CharField(source="patient.type", read_only=True)

    class Meta:
        model = Token
        fields = "__all__"