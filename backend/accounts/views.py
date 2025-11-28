from django.contrib.auth.models import User
from rest_framework import generics, permissions
from .serializers import UserRegisterSerializer

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


# Registro de Usuário
class UserRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]  # qualquer um pode se registrar


# Troca de Senha (usuário logado)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    old_password = request.data.get("old_password")
    new_password = request.data.get("new_password")

    if not old_password or not new_password:
        return Response({"error": "Campos obrigatórios"}, status=400)

    # Confere senha atual
    if not request.user.check_password(old_password):
        return Response({"error": "Senha antiga incorreta"}, status=400)

    # Atualiza senha
    request.user.set_password(new_password)
    request.user.save()

    return Response({"success": "Senha alterada com sucesso"})