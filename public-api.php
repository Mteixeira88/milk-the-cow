<?php
header('Access-Control-Allow-Origin: *');
require_once('config.php');

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
    $result = call_user_func_array($action, $args);
    echo json_encode($result);
}

function get_handler()
{
    echo '404 - Page not found.';
}

/**
 * FUNCTIONS
 *
 */

function viewRanking()
{
    $sql = 'SELECT * FROM ranking ORDER BY score DESC LIMIT 5';
    if ($result = query($sql)) {
        if (mysqli_num_rows($result) > 0) {
            $rankingTable = [];
            while ($row = $result->fetch_assoc()) {
                array_push($rankingTable, $row['score']);
            }
            rsort($rankingTable);
            // Free result set
            unset($result);
        }
    } else {
        return "ERROR: Could not able to execute $sql. ";
    }
    return $rankingTable;
}


function insertScore($value)
{
    return $value;
    $date = new Date();
    $sql = "INSERT INTO ranking (id, score, timestamp) VALUES (NULL, '$value','$date')";
    if ($result = query($sql)) {
        return $result;
    } else {
        return "ERROR: Could not able to execute $sql. ";
    }
}

?>
