from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PatientViewSet, TokenViewSet

router = DefaultRouter()
router.register(r'patients', PatientViewSet, basename='patients')
router.register(r'tokens', TokenViewSet, basename='tokens')

urlpatterns = [
    path('', include(router.urls)),
]