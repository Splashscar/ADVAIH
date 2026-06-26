from django.urls import path
from . import views

urlpatterns = [

    path(
        'eventos/',
        views.listar_eventos
    ),

    path(
        'eventos/<str:evento_id>/',
        views.detalle_evento
    ),

]