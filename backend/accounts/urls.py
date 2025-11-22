from django.urls import path
from rest_framework.authtoken.views import obtain_auth_token
from .views import UserRegisterView

urlpatterns = [
    path('register/', UserRegisterView.as_view(), name='register'),
    path('login/', obtain_auth_token, name='login'),
]
