
<?php

class Conexao
{
    private static $host = "localhost";
    private static $banco = "my_lembrete";
    private static $usuario = "root";
    private static $senha = "";

    public static function conectar()
    {
        try {
            $conexao = new PDO(
                "mysql:host=" . self::$host .
                ";dbname=" . self::$banco .
                ";charset=utf8mb4",
                self::$usuario,
                self::$senha
            );

            $conexao->setAttribute(
                PDO::ATTR_ERRMODE,
                PDO::ERRMODE_EXCEPTION
            );

            $conexao->setAttribute(
                PDO::ATTR_DEFAULT_FETCH_MODE,
                PDO::FETCH_ASSOC
            );

            return $conexao;

        } catch (PDOException $erro) {
            http_response_code(500);

            die(json_encode([
                "sucesso" => false,
                "mensagem" => "Erro ao conectar ao banco de dados."
            ]));
        }
    }
}
