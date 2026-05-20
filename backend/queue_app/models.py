from django.db import models

class Patient(models.Model):
    PATIENT_TYPE = [
        ('NORMAL', 'Normal'),
        ('SENIOR', 'Senior'),
        ('EMERGENCY', 'Emergency'),
    ]

    name = models.CharField(max_length=120)
    age = models.PositiveIntegerField()
    type = models.CharField(max_length=20, choices=PATIENT_TYPE, default='NORMAL')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Token(models.Model):
    STATUS = [
        ('WAITING', 'Waiting'),
        ('CALLED', 'Called'),
        ('DONE', 'Done'),
        ('SKIPPED', 'Skipped'),
    ]

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    number = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=STATUS, default='WAITING')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Token {self.number}"