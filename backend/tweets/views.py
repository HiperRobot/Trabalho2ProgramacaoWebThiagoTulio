from rest_framework import viewsets, permissions
from .models import Tweet
from .serializers import TweetSerializer
from .permissions import IsOwnerOrAdminDeleteOnly


class TweetViewSet(viewsets.ModelViewSet):
    serializer_class = TweetSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdminDeleteOnly]

    def get_queryset(self):
        # Todos os usuários autenticados podem ver TODOS os tweets
        return Tweet.objects.all().order_by('-created_at')

    def perform_create(self, serializer):
        # owner sempre é o usuário logado
        serializer.save(owner=self.request.user)
