from django.db import models
from queue_app.models import Patient

class Ward(models.Model):
    WARD_TYPE = [
        ('GENERAL', 'General'),
        ('ICU', 'ICU'),
        ('PRIVATE', 'Private'),
    ]

    name = models.CharField(max_length=100)
    ward_type = models.CharField(max_length=20, choices=WARD_TYPE)

    def __str__(self):
        return self.name


class Bed(models.Model):
    BED_STATUS = [
        ('AVAILABLE', 'Available'),
        ('OCCUPIED', 'Occupied'),
    ]

    ward = models.ForeignKey(Ward, on_delete=models.CASCADE)
    patient = models.ForeignKey(Patient, on_delete=models.SET_NULL, null=True, blank=True)
    number = models.CharField(max_length=20)
    status = models.CharField(max_length=20, choices=BED_STATUS, default='AVAILABLE')

    def __str__(self):
        return self.number