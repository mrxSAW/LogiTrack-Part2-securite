# LogiTrack

LogiTrack est une application web de gestion logistique. Elle permet de gérer les utilisateurs, les clients, les produits, les stocks et les commandes depuis une interface sécurisée.

Le projet est composé de deux applications :

- un backend REST développé avec Spring Boot ;
- un frontend développé avec React et Material UI.

## Fonctionnalités

- Inscription et connexion sécurisées avec JWT.
- Mots de passe chiffrés avec BCrypt.
- Gestion des autorisations selon les rôles `ADMIN`, `MANAGER` et `AGENT`.
- Gestion des utilisateurs et modification de leurs rôles.
- Ajout, consultation, modification et suppression des clients.
- Ajout, consultation, modification et suppression des produits.
- Recherche, filtrage, tri et pagination.
- Surveillance des produits dont le stock est faible.
- Création et suivi des commandes.
- Ajout de produits et de quantités dans une commande.
- Mise à jour automatique du stock.
- Gestion des statuts `EN_ATTENTE`, `EXPEDIEE` et `LIVREE`.
- Tableau de bord avec statistiques.
- Gestion centralisée des erreurs HTTP.
- Documentation de l'API avec Swagger/OpenAPI.
- Interface responsive adaptée aux ordinateurs, tablettes et téléphones.

## Rôles et permissions

| Fonctionnalité | ADMIN | MANAGER | AGENT |
|---|:---:|:---:|:---:|
| Consulter les clients, produits et commandes | Oui | Oui | Oui |
| Ajouter et modifier les clients | Oui | Oui | Non |
| Ajouter et modifier les produits | Oui | Oui | Non |
| Créer une commande et ajouter des produits | Oui | Oui | Non |
| Modifier le statut d'une commande | Oui | Oui | Oui |
| Consulter les statistiques | Oui | Oui | Non |
| Gérer les utilisateurs et leurs rôles | Oui | Non | Non |
| Supprimer des clients, produits et commandes | Oui | Non | Non |

## Technologies utilisées

### Backend

- Java 21
- Spring Boot 4
- Spring Web
- Spring Data JPA
- Spring Security
- JWT avec JJWT
- Bean Validation
- MySQL
- Lombok
- Maven
- JUnit et Spring Security Test
- Swagger / OpenAPI avec Springdoc

### Frontend

- React 19
- Vite
- React Router
- Material UI
- Axios
- React Hook Form
- Yup
- Oxlint

## Structure du projet

```text
LogiTrack-Part2-securite/
├── Backend/
│   └── logitrackAPP/
│       ├── src/main/java/
│       │   └── com/example/logitrackAPP/
│       │       ├── Security/
│       │       ├── config/
│       │       ├── controller/
│       │       ├── dto/
│       │       ├── exception/
│       │       ├── model/
│       │       ├── repository/
│       │       └── service/
│       ├── src/main/resources/
│       ├── src/test/
│       └── pom.xml
├── Frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── guards/
│   │   └── pages/
│   └── package.json
└── README.md
```

## Prérequis

Avant de lancer le projet, installer :

- Java JDK 21 ;
- MySQL ;
- Node.js et npm ;
- Git, si le projet est récupéré depuis un dépôt distant.

## Configuration de la base de données

Le backend utilise la base MySQL `logitrack`. Elle est créée automatiquement si elle n'existe pas.

Configurer le fichier :

```text
Backend/logitrackAPP/src/main/resources/application.properties
```

Exemple de configuration :

```properties
spring.application.name=logitrackAPP

spring.datasource.url=jdbc:mysql://localhost:3306/logitrack?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=VOTRE_MOT_DE_PASSE_MYSQL
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.open-in-view=false

app.jwt.secret=VOTRE_CLE_JWT_SECURISEE_D_AU_MOINS_32_CARACTERES
app.jwt.expiration=86400000
```

Ne jamais publier le vrai mot de passe MySQL ni la clé JWT dans un dépôt public.

## Lancement du backend

Ouvrir PowerShell dans le dossier du projet, puis exécuter :

```powershell
cd Backend\logitrackAPP
.\mvnw.cmd spring-boot:run
```

Le backend démarre sur :

```text
http://localhost:8080
```

## Lancement du frontend

Dans un deuxième terminal PowerShell :

```powershell
cd Frontend
npm.cmd install
npm.cmd run dev
```

Le frontend est accessible sur :

```text
http://localhost:5173
```

Le backend doit rester lancé pendant l'utilisation du frontend.

## Compte administrateur de démonstration

Au premier lancement, `AdminInitializer` crée un administrateur si celui-ci n'existe pas encore :

```text
Email : admin@logitrack.com
Mot de passe : 1234
```

Ce compte est réservé à la démonstration locale. Son mot de passe doit être remplacé avant tout déploiement réel.

Les nouveaux utilisateurs créés depuis la page d'inscription reçoivent automatiquement le rôle `AGENT`. Un administrateur peut ensuite modifier leur rôle depuis la page **Utilisateurs**.

## Documentation Swagger

Après le lancement du backend, ouvrir :

```text
http://localhost:8080/swagger-ui/index.html
```

Pour tester une route protégée :

1. exécuter `POST /api/auth/login` ;
2. copier le token retourné ;
3. cliquer sur **Authorize** dans Swagger ;
4. coller uniquement le token dans le champ prévu pour le Bearer Token ;
5. exécuter les endpoints autorisés pour le rôle connecté.

Le document OpenAPI brut est disponible sur :

```text
http://localhost:8080/v3/api-docs
```

## Principaux endpoints REST

| Méthode | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Créer un compte AGENT |
| POST | `/api/auth/login` | Se connecter et obtenir un JWT |
| GET | `/api/users` | Lister les utilisateurs |
| PUT | `/api/users/{id}/role` | Modifier le rôle d'un utilisateur |
| DELETE | `/api/users/{id}` | Supprimer un utilisateur |
| GET | `/api/clients` | Lister les clients |
| POST | `/api/clients` | Ajouter un client |
| PUT | `/api/clients/{id}` | Modifier un client |
| DELETE | `/api/clients/{id}` | Supprimer un client |
| GET | `/api/clients/search` | Rechercher des clients |
| GET | `/api/clients/page` | Lister les clients avec pagination |
| GET | `/api/products` | Lister les produits |
| POST | `/api/products` | Ajouter un produit |
| PUT | `/api/products/{id}` | Modifier un produit |
| DELETE | `/api/products/{id}` | Supprimer un produit |
| GET | `/api/products/search` | Rechercher des produits |
| GET | `/api/products/low-stock` | Lister les produits au stock faible |
| GET | `/api/products/page` | Lister les produits avec pagination |
| GET | `/api/orders` | Lister les commandes |
| POST | `/api/orders?clientId={id}` | Créer une commande |
| POST | `/api/orders/{id}/products` | Ajouter un produit à une commande |
| PUT | `/api/orders/{id}/status` | Modifier le statut d'une commande |
| DELETE | `/api/orders/{id}` | Supprimer une commande |
| GET | `/api/orders/filter` | Filtrer les commandes |
| GET | `/api/orders/page` | Lister les commandes avec pagination |
| GET | `/statistiques/dashboard` | Obtenir les statistiques du tableau de bord |

## Authentification JWT

Toutes les routes privées attendent l'en-tête HTTP suivant :

```http
Authorization: Bearer VOTRE_TOKEN_JWT
```

Le frontend ajoute automatiquement ce token aux requêtes Axios après la connexion. En cas de token absent ou expiré, l'utilisateur est redirigé vers la page de connexion.

## Tests et vérifications

### Tests du backend

```powershell
cd Backend\logitrackAPP
.\mvnw.cmd clean test
```

Résultat attendu :

```text
BUILD SUCCESS
```

### Vérification du frontend

```powershell
cd Frontend
npm.cmd run lint
npm.cmd run build
```

Résultats attendus :

```text
Found 0 warnings and 0 errors.
✓ built
```

## Règles principales de gestion

- L'adresse email d'un utilisateur doit être unique.
- Les mots de passe sont enregistrés sous forme chiffrée avec BCrypt.
- Une commande nouvellement créée reçoit le statut `EN_ATTENTE`.
- Les produits peuvent être ajoutés uniquement à une commande en attente.
- La quantité demandée ne doit pas dépasser le stock disponible.
- Le stock diminue lorsqu'un produit est ajouté à une commande.
- Une commande suit l'ordre `EN_ATTENTE` → `EXPEDIEE` → `LIVREE`.
- Les suppressions sensibles sont réservées à l'administrateur.
- Les pages et les endpoints sont protégés selon le rôle de l'utilisateur.

## État du projet

- Backend opérationnel.
- Frontend opérationnel.
- Authentification et autorisations opérationnelles.
- Tests backend réussis.
- Lint frontend sans erreur.
- Compilation frontend réussie.
- Documentation Swagger disponible.

## Améliorations possibles

- Utiliser des variables d'environnement pour les secrets.
- Ajouter davantage de tests d'intégration et de tests frontend.
- Ajouter Docker et Docker Compose.
- Déployer le backend, le frontend et la base de données.
- Ajouter un système de rafraîchissement des tokens JWT.

