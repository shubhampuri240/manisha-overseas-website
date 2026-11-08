<?php
declare(strict_types=1);

/*
 * Manisha Overseas virtual try-on proxy.
 * Keep FASHN_API_KEY on the PHP host only. Never put it in browser JavaScript or Git.
 * Uploaded person photos are read from PHP's temporary upload location and are not written to disk.
 */
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private');

function reply(int $status, array $payload): never {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

function fashnRequest(string $url, string $apiKey, ?string $body = null): array {
    if (!function_exists('curl_init')) {
        reply(500, ['message' => 'The PHP host needs the cURL extension enabled for virtual try-on.']);
    }
    $ch = curl_init($url);
    $headers = ['Authorization: Bearer ' . $apiKey, 'Accept: application/json'];
    if ($body !== null) {
        $headers[] = 'Content-Type: application/json';
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_CONNECTTIMEOUT => 15,
        CURLOPT_TIMEOUT => 90,
        CURLOPT_FOLLOWLOCATION => false,
    ]);
    $raw = curl_exec($ch);
    $curlError = curl_error($ch);
    $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($raw === false) {
        reply(502, ['message' => 'Could not reach the virtual try-on service. ' . $curlError]);
    }
    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        reply(502, ['message' => 'The virtual try-on service returned an invalid response.']);
    }
    if ($httpCode < 200 || $httpCode >= 300) {
        $message = $decoded['error']['message'] ?? $decoded['message'] ?? 'The virtual try-on request was rejected.';
        reply($httpCode >= 400 && $httpCode < 500 ? 422 : 502, ['message' => (string) $message]);
    }
    return $decoded;
}

$apiKey = getenv('FASHN_API_KEY') ?: '';
if ($apiKey === '') {
    reply(503, ['message' => 'Virtual try-on is not enabled on this host yet. Add FASHN_API_KEY to the PHP hosting environment to activate it.']);
}
$action = (string) ($_POST['action'] ?? $_GET['action'] ?? '');

if ($action === 'run') {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        reply(405, ['message' => 'Use POST to start a try-on.']);
    }
    if (!isset($_FILES['person_photo']) || (int) $_FILES['person_photo']['error'] !== UPLOAD_ERR_OK) {
        reply(400, ['message' => 'Choose a photo before starting the try-on.']);
    }
    $file = $_FILES['person_photo'];
    if ((int) $file['size'] < 1 || (int) $file['size'] > 10 * 1024 * 1024) {
        reply(413, ['message' => 'The person photo must be 10 MB or smaller.']);
    }
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file((string) $file['tmp_name']);
    $allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!in_array($mime, $allowed, true)) {
        reply(415, ['message' => 'Only JPG, PNG and WebP person photos are accepted.']);
    }

    $personBytes = file_get_contents((string) $file['tmp_name']);
    if ($personBytes === false) {
        reply(400, ['message' => 'The uploaded photo could not be read.']);
    }
    $personImage = 'data:' . $mime . ';base64,' . base64_encode($personBytes);
    unset($personBytes);

    $garmentImage = (string) ($_POST['garment_image'] ?? '');
    if (strlen($garmentImage) > 14 * 1024 * 1024 ||
        !preg_match('#^data:image/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$#', $garmentImage)) {
        reply(400, ['message' => 'Choose a valid garment image from the website first.']);
    }

    $payload = [
        'model_name' => 'tryon-v1.6',
        'inputs' => [
            'model_image' => $personImage,
            'garment_image' => $garmentImage,
            'category' => 'auto',
            'mode' => 'balanced',
            'num_samples' => 1,
            'output_format' => 'jpeg',
            'return_base64' => true,
        ],
    ];
    unset($personImage, $garmentImage);
    $result = fashnRequest('https://api.fashn.ai/v1/run', $apiKey, json_encode($payload, JSON_UNESCAPED_SLASHES));
    $id = $result['id'] ?? '';
    if (!is_string($id) || $id === '') {
        reply(502, ['message' => 'The virtual try-on service did not return a request ID.']);
    }
    reply(200, ['id' => $id]);
}

if ($action === 'status') {
    $id = (string) ($_POST['id'] ?? $_GET['id'] ?? '');
    if (!preg_match('/^[A-Za-z0-9-]{8,128}$/', $id)) {
        reply(400, ['message' => 'The try-on request ID is invalid.']);
    }
    $result = fashnRequest('https://api.fashn.ai/v1/status/' . rawurlencode($id), $apiKey);
    $status = (string) ($result['status'] ?? '');
    if ($status === 'failed') {
        $message = $result['error']['message'] ?? 'The virtual try-on could not be completed.';
        reply(200, ['status' => 'failed', 'message' => (string) $message]);
    }
    if ($status === 'completed') {
        $output = $result['output'] ?? [];
        if (!is_array($output) || !isset($output[0]) || !is_string($output[0])) {
            reply(502, ['message' => 'The virtual try-on completed without an image result.']);
        }
        reply(200, ['status' => 'completed', 'output' => $output]);
    }
    reply(200, ['status' => $status !== '' ? $status : 'processing']);
}

reply(400, ['message' => 'Unknown try-on action.']);
