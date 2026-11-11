<?php

require_once __DIR__ . "/../config/conexao.php";

header("Content-Type: application/json; charset=UTF-8");

try {
    $dados = json_decode(file_get_contents("php://input"), true);

    if (
        !is_array($dados) ||
        empty($dados["id"]) ||
        empty(trim($dados["titulo"] ?? "")) ||
        empty($dados["data"]) ||
        empty($dados["horario"])
    ) {
        http_response_code(400);
        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Informe ID, título, data e horário."
        ]);
        exit;
    }

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

    $id = (int) $dados["id"];
    $diario = !empty($dados["diario"]) ? 1 : 0;

    $buscar = $conexao->prepare(
        "SELECT * FROM lembretes WHERE id = :id FOR UPDATE"
    );

    $buscar->execute([":id" => $id]);
    $atual = $buscar->fetch(PDO::FETCH_ASSOC);

    if (!$atual) {
        $conexao->rollBack();

        http_response_code(404);

        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Lembrete não encontrado."
        ]);

        exit;
    }

    $serieId = $atual["serie_id"]
        ? (int) $atual["serie_id"]
        : ($diario ? $id : null);

    // ATUALIZAR LEMBRETE

    $sql = "UPDATE lembretes SET
                titulo = :titulo,
                nota = :nota,
                data = :data,
                horario = :horario,
                diario = :diario,
                prioridade = :prioridade,
                serie_id = :serie_id
            WHERE id = :id";

    $stmt = $conexao->prepare($sql);

    $stmt->execute([
        ":id" => $id,
        ":titulo" => trim($dados["titulo"]),
        ":nota" => trim($dados["nota"] ?? ""),
        ":data" => $dados["data"],
        ":horario" => $dados["horario"],
        ":diario" => $diario,
        ":prioridade" => $prioridade,
        ":serie_id" => $diario ? $serieId : null
    ]);



    if ($serieId !== null && $diario === 1) {

        $atualizarFuturos = $conexao->prepare(
            "UPDATE lembretes SET
                titulo = :titulo,
                nota = :nota,
                data = DATE_ADD(:data, INTERVAL DATEDIFF(data, :data_referencia) DAY),
                horario = :horario,
                diario = 1,
                prioridade = :prioridade
             WHERE serie_id = :serie_id
               AND id <> :id
               AND concluido = 0
               AND data > :data_referencia"
        );

        $atualizarFuturos->execute([
            ":titulo" => trim($dados["titulo"]),
            ":nota" => trim($dados["nota"] ?? ""),
            ":data" => $dados["data"],
            ":data_referencia" => $atual["data"],
            ":horario" => $dados["horario"],
            ":prioridade" => $prioridade,
            ":serie_id" => $serieId,
            ":id" => $id
        ]);

    } elseif ($serieId !== null && $diario === 0) {

       

        $desativarFuturos = $conexao->prepare(
            "UPDATE lembretes
             SET diario = 0, serie_id = NULL
             WHERE serie_id = :serie_id
               AND id <> :id
               AND concluido = 0
               AND data > :data"
        );

        $desativarFuturos->execute([
            ":serie_id" => $serieId,
            ":id" => $id,
            ":data" => $atual["data"]
        ]);
    }

    $conexao->commit();

    echo json_encode([
        "sucesso" => true,
        "mensagem" => "Lembrete atualizado com sucesso!",
        "prioridade" => $prioridade
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $erro) {

    if (isset($conexao) && $conexao->inTransaction()) {
        $conexao->rollBack();
    }

    http_response_code(500);

    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Erro ao editar lembrete."
    ], JSON_UNESCAPED_UNICODE);
}