
<?php

require_once __DIR__ . "/../config/conexao.php";

header("Content-Type: application/json; charset=UTF-8");

try {
    $dados = json_decode(file_get_contents("php://input"), true);

    if (
        !is_array($dados) ||
        empty($dados["id"]) ||
        !array_key_exists("concluido", $dados)
    ) {
        http_response_code(400);
        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Informe o ID e o status de conclusão."
        ]);
        exit;
    }

    $id = (int) $dados["id"];

    $concluido = filter_var(
        $dados["concluido"],
        FILTER_VALIDATE_BOOLEAN
    ) ? 1 : 0;

    $conexao = Conexao::conectar();
    $conexao->beginTransaction();

    // Buscar lembrete
    $buscar = $conexao->prepare(
        "SELECT * FROM lembretes WHERE id = :id FOR UPDATE"
    );

    $buscar->execute([":id" => $id]);
    $lembrete = $buscar->fetch(PDO::FETCH_ASSOC);

    if (!$lembrete) {
        $conexao->rollBack();

        http_response_code(404);
        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Lembrete não encontrado."
        ]);
        exit;
    }

    // Identificar a série do lembrete diário
    $serieId = $lembrete["serie_id"]
        ? (int) $lembrete["serie_id"]
        : ($lembrete["diario"] ? $id : null);

    if ($serieId !== null) {
        $atualizarSerie = $conexao->prepare(
            "UPDATE lembretes
             SET serie_id = :serie_id
             WHERE id = :id AND serie_id IS NULL"
        );

        $atualizarSerie->execute([
            ":serie_id" => $serieId,
            ":id" => $id
        ]);
    }

    // Atualizar conclusão e registrar data real
    $atualizar = $conexao->prepare(
        "UPDATE lembretes
         SET concluido = :concluido,
             concluido_em = CASE
                 WHEN :status = 1 THEN
                     COALESCE(concluido_em, :data_conclusao)
                 ELSE NULL
             END
         WHERE id = :id"
    );

    $dataConclusao = (new DateTimeImmutable(
        "now",
        new DateTimeZone("America/Sao_Paulo")
    ))->format("Y-m-d H:i:s");

    $atualizar->execute([
        ":concluido" => $concluido,
        ":status" => $concluido,
        ":data_conclusao" => $dataConclusao,
        ":id" => $id
    ]);

    // Tratamento dos lembretes diários
    if ($lembrete["diario"] && $serieId !== null) {

        if ($concluido === 1) {

            $dataAtual = new DateTime($lembrete["data"]);
            $dataAtual->modify("+1 day");

            $proximaData = $dataAtual->format("Y-m-d");

            $verificar = $conexao->prepare(
                "SELECT id
                 FROM lembretes
                 WHERE serie_id = :serie_id
                   AND data >= :data
                   AND concluido = 0
                 LIMIT 1"
            );

            $verificar->execute([
                ":serie_id" => $serieId,
                ":data" => $proximaData
            ]);

            if (!$verificar->fetch()) {

                $inserir = $conexao->prepare(
                    "INSERT INTO lembretes
                    (titulo, nota, data, horario, concluido, diario, serie_id)
                    VALUES
                    (:titulo, :nota, :data, :horario, 0, 1, :serie_id)"
                );

                $inserir->execute([
                    ":titulo" => $lembrete["titulo"],
                    ":nota" => $lembrete["nota"],
                    ":data" => $proximaData,
                    ":horario" => $lembrete["horario"],
                    ":serie_id" => $serieId
                ]);
            }

        } else {

            $removerProxima = $conexao->prepare(
                "DELETE FROM lembretes
                 WHERE serie_id = :serie_id
                   AND data > :data
                   AND concluido = 0"
            );

            $removerProxima->execute([
                ":serie_id" => $serieId,
                ":data" => $lembrete["data"]
            ]);
        }
    }

    $conexao->commit();

    echo json_encode([
        "sucesso" => true,
        "mensagem" => "Status do lembrete atualizado!"
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $erro) {

    if (isset($conexao) && $conexao->inTransaction()) {
        $conexao->rollBack();
    }

    http_response_code(500);

    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Erro ao atualizar conclusão."
    ], JSON_UNESCAPED_UNICODE);
}
