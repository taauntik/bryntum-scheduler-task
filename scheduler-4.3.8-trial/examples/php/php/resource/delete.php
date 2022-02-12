<?php

require_once "../session.php";

$id = isset($_POST["id"]) ? $_POST["id"] : $_GET["id"];
if (empty($id)) {
    sendError("No get/post id parameter");
}

$resources = $_SESSION["resources"];
$ids       = json_decode($id);

for ($i = count($resources) - 1; $i >= 0; $i--) {
    $record = $resources[$i];
    if (in_array($record["id"], $ids)) {
        array_splice($resources, $i, 1);
    };
}

$_SESSION["resources"] = $resources;

sendSuccess();
