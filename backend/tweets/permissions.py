from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsOwnerOrAdminDeleteOnly(BasePermission):
    """
    - SAFE_METHODS (GET, HEAD, OPTIONS): permitido para usuários autenticados
      (mas o queryset já restringe o que é exibido).
    - PUT/PATCH: somente o dono do tweet pode editar.
    - DELETE: dono ou admin podem deletar.
    """

    def has_object_permission(self, request, view, obj):
        user = request.user

        if not user.is_authenticated:
            return False

        # Leitura é controlada pelo queryset, aqui liberamos se chegou aqui
        if request.method in SAFE_METHODS:
            return True

        # Atualização: só o dono
        if request.method in ['PUT', 'PATCH']:
            return obj.owner == user

        # Remoção: dono ou admin
        if request.method == 'DELETE':
            return obj.owner == user or user.is_staff

        return False
