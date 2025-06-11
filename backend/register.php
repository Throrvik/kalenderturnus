<?php
// Inkluder database.php for å koble til databasen
require_once 'database.php';
header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Rens output-buffer for å sikre ren JSON-respons
    if (ob_get_contents()) ob_clean();

    // Hent input fra skjemaet og trim hvite mellomrom
    $name = isset($_POST['firstname']) ? trim($_POST['firstname']) : '';
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
    $password = isset($_POST['password']) ? trim($_POST['password']) : '';
    $password_repeat = isset($_POST['password_repeat']) ? trim($_POST['password_repeat']) : '';

    // Valider at ingen av feltene er tomme
    if (empty($name) || empty($email) || empty($password) || empty($password_repeat)) {
        echo json_encode(["status" => "error", "message" => "Alle feltene må fylles ut."]);
        exit; // Stopp all annen output
    }

    // Valider at e-postadressen er gyldig
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["status" => "error", "message" => "Ugyldig e-postadresse."]);
        exit; // Stopp all annen output
    }

    // Valider at passordene matcher
    if ($password !== $password_repeat) {
        echo json_encode(["status" => "error", "message" => "Passordene stemmer ikke overens."]);
        exit; // Stopp all annen output
    }

    // Hash passordet for sikker lagring
    $hashed_password = password_hash($password, PASSWORD_BCRYPT);

    try {
        // Opprett PDO-tilkobling til databasen med informasjon fra `database.php`
        $db = new PDO($dsn, $username, $db_password, $options);

        // Sjekk om e-post allerede er registrert
        $stmt = $db->prepare("SELECT COUNT(*) FROM users WHERE email = :email");
        $stmt->bindParam(':email', $email, PDO::PARAM_STR);
        $stmt->execute();

        if ($stmt->fetchColumn() > 0) {
            echo json_encode(["status" => "error", "message" => "E-postadressen er allerede registrert."]);
            exit; // Stopp all annen output
        }

        // Sett inn ny bruker i databasen
        $stmt = $db->prepare("INSERT INTO users (firstname, email, password) VALUES (:name, :email, :password)");
        $stmt->bindParam(':name', $name, PDO::PARAM_STR);
        $stmt->bindParam(':email', $email, PDO::PARAM_STR);
        $stmt->bindParam(':password', $hashed_password, PDO::PARAM_STR);
        $stmt->execute();

        // Send suksessmelding når registreringen er vellykket, inkludert brukernavn
        echo json_encode(["success" => true, "message" => "Bruker er opprettet", "firstname" => $name]);
        exit; // Stopp all annen output

    } catch (PDOException $e) {
        // Generisk feilmelding ved databasefeil
        error_log("Database error: " . $e->getMessage()); // Logg feilmeldingen for debugging
        echo json_encode(["status" => "error", "message" => "Noe gikk galt. Vennligst prøv igjen senere."]);
        exit; // Stopp all annen output
    }
}
?>