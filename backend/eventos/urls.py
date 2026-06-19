from django.urls import path
from . import views

urlpatterns = [
    
    path('auth/register/', views.register),
    path('auth/login/', views.login),

    
    path('eventos/', views.listar_eventos),



    
    path('', views.home),
]