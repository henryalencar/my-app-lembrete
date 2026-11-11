<?php

require_once __DIR__ . "/../config/conexao.php";

header("Content-Type: application/json; charset=UTF-8");

try {

    $conexao = Conexao::conectar();

    $sql = "SELECT * FROM lembretes
            ORDER BY data ASC, horario ASC";

    $stmt = $conexao->prepare($sql);
    $stmt->execute();

    $lembretes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "sucesso" => true,
        "dados" => $lembretes
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $erro) {

    http_response_code(500);

    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Erro ao listar lembretes."
    ], JSON_UNESCAPED_UNICODE);
}