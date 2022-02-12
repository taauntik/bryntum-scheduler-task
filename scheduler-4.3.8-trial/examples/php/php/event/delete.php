<?php

require_once "../session.php";

$id = isset($_POST["id"]) ? $_POST["id"] : $_GET["id"];
if (empty($id)) {
    sendError("No get/post id parameter");
}

$events = $_SESSION["events"];
$ids    = json_decode($id);

for ($i = count($events) - 1; $i >= 0; $i--) {
    $record = $events[$i];
    if (in_array($record["id"], $ids)) {
        array_splice($events, $i, 1);
    };
}

$_SESSION["events"] = $events;

sendSuccess();