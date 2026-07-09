using System.Collections;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;

public class StripeCheckoutLauncher : MonoBehaviour
{
    [SerializeField] private string backendBaseUrl = "http://localhost:4242";
    [SerializeField] private string playerId = "unity-player-001";

    public void BuyStarterPack()
    {
        StartCoroutine(StartCheckout("starter-pack"));
    }

    public void BuyProPack()
    {
        StartCoroutine(StartCheckout("pro-pack"));
    }

    private IEnumerator StartCheckout(string productId)
    {
        var payload = JsonUtility.ToJson(new CreateCheckoutSessionRequest
        {
            playerId = playerId,
            productId = productId
        });

        using var request = new UnityWebRequest($"{backendBaseUrl}/api/checkout-sessions", UnityWebRequest.kHttpVerbPOST);
        var body = Encoding.UTF8.GetBytes(payload);
        request.uploadHandler = new UploadHandlerRaw(body);
        request.downloadHandler = new DownloadHandlerBuffer();
        request.SetRequestHeader("Content-Type", "application/json");

        yield return request.SendWebRequest();

        if (request.result != UnityWebRequest.Result.Success)
        {
            Debug.LogError($"Stripe checkout creation failed: {request.error}\n{request.downloadHandler.text}");
            yield break;
        }

        var response = JsonUtility.FromJson<CreateCheckoutSessionResponse>(request.downloadHandler.text);

        if (string.IsNullOrWhiteSpace(response.checkoutUrl))
        {
            Debug.LogError("Stripe checkout response did not include a checkout URL.");
            yield break;
        }

        Application.OpenURL(response.checkoutUrl);
    }

    [System.Serializable]
    private class CreateCheckoutSessionRequest
    {
        public string playerId;
        public string productId;
    }

    [System.Serializable]
    private class CreateCheckoutSessionResponse
    {
        public string orderId;
        public string checkoutUrl;
    }
}
