from django.urls import path
from . import views

urlpatterns = [
    
    path('auth/register/', views.register),
    path('auth/login/', views.login),

    
    path('eventos/', views.listar_eventos),
    path('eventos/<str:evento_id>/', views.obtener_evento),

    
    path('favoritos/', views.listar_favoritos),

    
    path('', views.home),
]