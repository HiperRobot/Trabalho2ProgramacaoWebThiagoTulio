from django.contrib.auth.models import User
from rest_framework import generics, permissions
from .serializers import UserRegisterSerializer


class UserRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]  # qualquer um pode se registrar
