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

    def save(self, *args, **kwargs):
        is_new = self.pk is None

        super().save(*args, **kwargs)

        if is_new:
            last_token = Token.objects.order_by('-number').first()

            next_number = 1
            if last_token:
                next_number = last_token.number + 1

            Token.objects.create(
                patient=self,
                number=next_number,
                status='WAITING'
            )

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