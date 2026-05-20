from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WardViewSet, BedViewSet

router = DefaultRouter()
router.register(r'wards', WardViewSet, basename='wards')
router.register(r'beds', BedViewSet, basename='beds')

urlpatterns = [
    path('', include(router.urls)),
]