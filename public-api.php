<?php
require_once('connect.php');
require_once('functions.php');
header('Access-Control-Allow-Origin: *');

switch ($_SERVER['REQUEST_METHOD']) {
    case 'POST':
        post_handler();
        return;
    case 'GET':
        get_handler();
        return;
    default:
        echo 'Not implemented';
        return;
}

function post_handler()
{
    $data = json_decode($_POST['data'], true);
    $action = $data['action'];
    if ($data['args']) {
        $args = $data['args'];
    } else {
        $args = [];
    }
    $result = call_user_func_array($action, [$args]);
    echo json_encode($result);
}

function get_handler()
{
    echo '404 - Page not found.';
}

?>
