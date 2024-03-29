from django.urls import path

from . import views

app_name = 'match'
urlpatterns = [
    path('', views.IndexView.as_view(), name='index'),
    path('<int:id>', views.MatchDataView.as_view(), name='specific'),
]