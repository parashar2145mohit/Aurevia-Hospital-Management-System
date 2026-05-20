from django.db import transaction
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Patient, Token
from .serializers import PatientSerializer, TokenSerializer


class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all().order_by("-created_at")
    serializer_class = PatientSerializer


class TokenViewSet(viewsets.ModelViewSet):
    queryset = Token.objects.select_related("patient").all().order_by("created_at")
    serializer_class = TokenSerializer

    @action(detail=False, methods=["post"], url_path="next")
    def next_token(self, request):
        with transaction.atomic():
            token = (
                Token.objects.select_for_update()
                .select_related("patient")
                .filter(status="WAITING")
                .order_by("number", "created_at")
                .first()
            )

            if not token:
                return Response(
                    {"message": "No waiting patient found"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            token.status = "CALLED"
            token.save(update_fields=["status"])

        return Response(
            {
                "message": "Next patient called successfully",
                "token": TokenSerializer(token).data,
                "patient": {
                    "id": token.patient.id,
                    "name": token.patient.name,
                    "age": token.patient.age,
                    "type": token.patient.type,
                },
            }
        )

    @action(detail=True, methods=["post"], url_path="skip")
    def skip_token(self, request, pk=None):
        token = self.get_object()
        token.status = "SKIPPED"
        token.save(update_fields=["status"])
        return Response(
            {"message": "Token skipped", "token": TokenSerializer(token).data}
        )

    @action(detail=True, methods=["post"], url_path="done")
    def done_token(self, request, pk=None):
        token = self.get_object()
        token.status = "DONE"
        token.save(update_fields=["status"])
        return Response(
            {"message": "Token marked done", "token": TokenSerializer(token).data}
        )