
<?php

require_once __DIR__ . "/../config/conexao.php";

header("Content-Type: application/json; charset=UTF-8");

try {
    $dados = json_decode(file_get_contents("php://input"), true);

    if (!is_array($dados) || empty($dados["id"])) {
        http_response_code(400);

        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Informe o ID do lembrete."
        ]);
        exit;
    }

    $conexao = Conexao::conectar();

    $sql = "DELETE FROM lembretes WHERE id = :id";

    $stmt = $conexao->prepare($sql);
    $stmt->execute([":id" => $dados["id"]]);

    if ($stmt->rowCount() === 0) {
        http_response_code(404);

        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Lembrete não encontrado."
        ]);
        exit;
    }

    echo json_encode([
        "sucesso" => true,
        "mensagem" => "Lembrete excluído com sucesso!"
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $erro) {
    http_response_code(500);

    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Erro ao excluir lembrete."
    ]);
}
