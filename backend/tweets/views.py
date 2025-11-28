from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Tweet
from .serializers import TweetSerializer
from .permissions import IsOwnerOrAdminDeleteOnly
from difflib import SequenceMatcher

def find_similar_tweets(content, threshold=0.4):
    tweets = Tweet.objects.all()
    similar = []

    for t in tweets:
        ratio = SequenceMatcher(None, content, t.content).ratio()
        if ratio >= threshold:
            similar.append({
                "id": t.id,
                "owner_username": t.owner.username,
                "content": t.content,
                "similarity": round(ratio, 3),
            })

    similar.sort(key=lambda x: x["similarity"], reverse=True)
    return similar


class TweetViewSet(viewsets.ModelViewSet):
    serializer_class = TweetSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdminDeleteOnly]

    def get_queryset(self):
        # Todos os usuários autenticados podem ver TODOS os tweets
        return Tweet.objects.all().order_by('-created_at')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # salva tweet com owner
        tweet = serializer.save(owner=request.user)

        # calcula similares
        similar = find_similar_tweets(tweet.content)

        # serializa similares corretamente
        similar_serialized = TweetSerializer(Tweet.objects.filter(id__in=[s["id"] for s in similar]), many=True).data

        return Response(
            {
                "tweet": TweetSerializer(tweet).data,
                "similar_tweets": similar_serialized,
            },
            status=status.HTTP_201_CREATED
        )
