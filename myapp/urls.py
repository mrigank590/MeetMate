from django.urls import path
from myapp import views

urlpatterns = [
    path('api/ai-endpoint/', views.ai_endpoint),
    # Other URLs
]