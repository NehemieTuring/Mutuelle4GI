# API Mutuelle - Backend Spring Boot

Ce projet contient le backend de l'application Mutuelle, développé en **Spring Boot 4.x / Java 21**, conteneurisé avec **Docker** et relié à une base de données **MySQL**.

## 🛠️ Prérequis
Avant de démarrer le projet, assurez-vous d'avoir installé sur votre machine :
- **Docker** et **Docker Compose**
- (Optionnel) **Java 21** (si vous souhaitez exécuter le backend localement sans passer par Docker)

## 📁 Structure du Projet
Le projet contient :
- `Dockerfile` : Pour construire l'image Docker de l'API (Multi-stage build léger et sécurisé).
- `docker-compose.yml` : Pour lancer simultanément l'API et MySQL.
- `.env` : Pour gérer les variables d'environnement (mots de passe, ports, etc.).
- Le code source Spring Boot dans `src/`.

## 🚀 Démarrage Rapide avec Docker

1. **Vérifier le fichier `.env`**
   Un fichier `.env` a été généré à la racine avec des valeurs par défaut. Vous pouvez modifier ces valeurs selon vos besoins.

2. **Lancer les conteneurs**
   Pour lancer la base de données et l'API Spring Boot, exécutez la commande suivante à la racine :
   ```bash
   docker compose up --build
   ```
   *Note : Le premier lancement construira l'image de l'API (ce qui peut prendre quelques minutes pour le téléchargement et la compilation Maven).*

3. **Vérifier le statut**
   - L'API sera accessible sur : `http://localhost:8081`
   - Un endpoint de test est disponible à l'adresse : `http://localhost:8081/api/hello` qui retourne :
     ```json
     {
       "message": "Hello from Mutuelle Spring Boot API!",
       "status": "success"
     }
     ```

4. **Arrêter l'environnement**
   ```bash
   docker compose down
   ```
   Pour supprimer aussi les données persistées de la base de données (si vous voulez réinitialiser la BD) :
   ```bash
   docker compose down -v
   ```

## 💻 Développement Local (Hybride)

Si vous préférez exécuter l'application Spring Boot directement sur votre machine (par exemple pour bénéficier du rechargement à chaud avec DevTools) tout en utilisant MySQL dans Docker :

1. **Lancer uniquement MySQL en arrière-plan** :
   ```bash
   docker compose up db -d
   ```

2. **Définir les variables d'environnement** (ou configurer votre IDE pour charger les variables de `.env`) :
   ```bash
   export DB_HOST=localhost
   export DB_PORT=3307
   export DB_NAME=mutuelle_db
   export DB_USER=mutuelle_user
   export DB_PASSWORD=mutuelle_pass
   ```

3. **Lancer le serveur Spring Boot** :
   ```bash
   ./mvnw spring-boot:run
   ```
