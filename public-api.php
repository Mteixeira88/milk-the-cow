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

    try {
        if (is_callable($action)) {
            $result = call_user_func_array($action, [$args]);
        } else {
            throw new Exception("$action is not callable");
        }
        if (!$result) {
            throw new \RuntimeException("Some error occurred with your request. Your action is '" . $action . "' and your args are '" . join($args) . "'");
        }
    } catch (\Exception $e) {
        http_response_code(501);
        $result = array('message' => $e->getMessage());
    }
    echo json_encode($result);
}

function get_handler()
{
    echo '404 - Page not found.';
}

?>
