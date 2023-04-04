from django.urls import path
from . import views

urlpatterns = [
    path('change-colors', views.change_colors, name='change-colors'),
    path('flip', views.flip, name='flip'),
    path('find-differences', views.find_differences, name='find-differences'),
]