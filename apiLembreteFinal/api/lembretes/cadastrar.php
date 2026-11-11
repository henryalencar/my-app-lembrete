<?php

require_once __DIR__ . "/../config/conexao.php";

header("Content-Type: application/json; charset=UTF-8");

try {
    $dados = json_decode(file_get_contents("php://input"), true);

    if (
        !is_array($dados) ||
        empty(trim($dados["titulo"] ?? "")) ||
        empty($dados["data"]) ||
        empty($dados["horario"])
    ) {
        http_response_code(400);
        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Título, data e horário são obrigatórios."
        ]);
        exit;
    }

    $titulo = trim($dados["titulo"]);
    $nota = trim($dados["nota"] ?? "");
    $data = $dados["data"];
    $horario = $dados["horario"];
    $diario = !empty($dados["diario"]) ? 1 : 0;

    // PRIORIDADE
    $prioridade = $dados["prioridade"] ?? "media";

    $prioridadesPermitidas = ["baixa", "media", "alta"];

    if (!in_array($prioridade, $prioridadesPermitidas, true)) {
        http_response_code(400);
        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Prioridade inválida."
        ]);
        exit;
    }

    $conexao = Conexao::conectar();
    $conexao->beginTransaction();

    $sql = "INSERT INTO lembretes
            (titulo, nota, data, horario, diario, prioridade)
            VALUES
            (:titulo, :nota, :data, :horario, :diario, :prioridade)";

    $stmt = $conexao->prepare($sql);

    $stmt->execute([
        ":titulo" => $titulo,
        ":nota" => $nota,
        ":data" => $data,
        ":horario" => $horario,
        ":diario" => $diario,
        ":prioridade" => $prioridade
    ]);

    $id = (int) $conexao->lastInsertId();

    if ($diario) {
        $atualizarSerie = $conexao->prepare(
            "UPDATE lembretes SET serie_id = :serie_id WHERE id = :id"
        );

        $atualizarSerie->execute([
            ":serie_id" => $id,
            ":id" => $id
        ]);
    }

    $conexao->commit();

    http_response_code(201);

    echo json_encode([
        "sucesso" => true,
        "mensagem" => "Lembrete cadastrado com sucesso!",
        "id" => $id,
        "prioridade" => $prioridade
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $erro) {

    if (isset($conexao) && $conexao->inTransaction()) {
        $conexao->rollBack();
    }

    http_response_code(500);

    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Erro ao cadastrar lembrete."
    ], JSON_UNESCAPED_UNICODE);
}