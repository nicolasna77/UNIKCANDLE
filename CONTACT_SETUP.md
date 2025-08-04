# Configuration du Formulaire de Contact

## Variables d'environnement requises

Ajoutez ces variables à votre fichier `.env.local` :

```env
# Resend (pour l'envoi d'emails)
RESEND_API_KEY="re_votre_clé_api_resend"

# URL de l'application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Configuration Resend

1. Créez un compte sur [Resend](https://resend.com)
2. Obtenez votre clé API
3. Configurez votre domaine d'envoi (ex: contact@unikcandle.com)
4. Ajoutez la clé API dans vos variables d'environnement

## Fonctionnalités

Le formulaire de contact envoie :

1. **Email à l'équipe** : Notifie l'équipe d'un nouveau message
2. **Email de confirmation** : Confirme au client que son message a été reçu

## Templates d'email

Les emails utilisent des templates React Email professionnels :

- `src/emails/contact-form.tsx` : Template pour les emails de contact
- Design responsive et moderne
- Support des emails de confirmation et de notification

## Validation

Le formulaire valide :

- Champs obligatoires (prénom, nom, email, sujet, message)
- Format d'email valide
- Longueur minimale des champs

## Utilisation

Le formulaire est accessible sur `/contact` et envoie les données à `/api/contact`.
