using UnityEngine;

public class LevelGenerator : MonoBehaviour
{
    public GameObject groundTilePrefab;
    public GameObject trianglePrefab;
    public int tilesToSpawn = 100;
    public float tileLength = 10f;
    public float pathWidth = 4f;

    private Vector3 currentSpawnPosition = Vector3.zero;
    private int triangleCount = 0; // لتتبع عدد المثلثات التي تم جمعها

    void Start()
    {
        GenerateLevel();
    }

    void GenerateLevel()
    {
        for (int i = 0; i < tilesToSpawn; i++)
        {
            SpawnTile();
        }
    }

    void SpawnTile()
    {
        // إنشاء طريق غير مستقيم (عشوائياً يمين أو يسار قليلاً)
        float randomX = Random.Range(-2f, 2f);
        Vector3 spawnPos = currentSpawnPosition + new Vector3(randomX, 0, tileLength);
        
        // تدوير الطريق قليلاً لجعله يبدو متعرجاً
        Quaternion spawnRot = Quaternion.Euler(0, Random.Range(-10f, 10f), 0);

        GameObject newTile = Instantiate(groundTilePrefab, spawnPos, spawnRot);
        currentSpawnPosition = newTile.transform.position + (newTile.transform.forward * tileLength); // تحديث الموقع التالي

        // إنشاء مثلث (عائق أو نقطة)
        // ننشئ المثلث في منتصف الطريق أو عشوائياً على يمين/يسار الطريق
        if (Random.value > 0.3f) // 70% فرصة لظهور مثلث
        {
            Vector3 trianglePos = newTile.transform.position + (newTile.transform.forward * (tileLength / 2));
            // إزاحة بسيطة لليمين أو اليسار
            trianglePos += newTile.transform.right * Random.Range(-pathWidth/2, pathWidth/2);
            trianglePos.y += 1f; // رفعه للأعلى قليلاً

            GameObject triangle = Instantiate(trianglePrefab, trianglePos, Quaternion.identity);
            
            // ضبط الحاوية الأب (Parent) للنظافة
            triangle.transform.SetParent(newTile.transform);
            
            // ربط كود الحصاد بالمثلث
            Collectible collectScript = triangle.GetComponent<Collectible>();
            if (collectScript != null)
            {
                collectScript.Initialize(this); // إعطاء المثلث إشارة لمولد المستوى
            }
        }
    }

    // يتم استدعاؤها عند اصطدام الكرة بمثلث
    public void OnTriangleCollected()
    {
        triangleCount++;
        Debug.Log("Triangles collected: " + triangleCount);
        
        // تحديث مدير اللعبة بزيادة العداد
        if (GameManager.Instance != null)
        {
            GameManager.Instance.AddTriangle();
        }
    }
}
