using UnityEngine;

public class GameManager : MonoBehaviour
{
    // النمط Singleton للوصول السهل للملف من ملفات أخرى
    public static GameManager Instance { get; private set; }

    [Header("Game Settings")]
    public int speedIncreaseInterval = 15;
    public float speedIncreasePercentage = 25f;
    public int totalTrianglesCollected = 0;

    [Header("References")]
    public PlayerController playerController;

    void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
        }
        else
        {
            Destroy(gameObject);
        }
    }

    public void AddTriangle()
    {
        totalTrianglesCollected++;

        // التحقق من الشرط: هل وصلنا لمضاعف الـ 15؟
        if (totalTrianglesCollected % speedIncreaseInterval == 0)
        {
            IncreaseGameSpeed();
        }
    }

    void IncreaseGameSpeed()
    {
        if (playerController != null)
        {
            playerController.IncreaseSpeed(speedIncreasePercentage);
            Debug.Log($"Speed increased by {speedIncreasePercentage}%! Total Triangles: {totalTrianglesCollected}");
        }
    }
}
