from rest_framework import serializers
from .models import Tweet


class TweetSerializer(serializers.ModelSerializer):
    owner_username = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Tweet
        fields = [
            'id',
            'owner',
            'owner_username',
            'content',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'owner',
            'owner_username',
            'created_at',
            'updated_at',
        ]
