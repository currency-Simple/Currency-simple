using UnityEngine;

public class Collectible : MonoBehaviour
{
    private LevelGenerator levelGenerator;

    // يتم استدعاؤها عند إنشاء المثلث لتوصيله بالمولد
    public void Initialize(LevelGenerator generator)
    {
        levelGenerator = generator;
    }

    void OnTriggerEnter(Collider other)
    {
        // التحقق مما إذا كان اللاعب هو من اصطدم
        if (other.CompareTag("Player"))
        {
            // إخبار المولد بأن المثلث تم جمعه
            if (levelGenerator != null)
            {
                levelGenerator.OnTriangleCollected();
            }

            // إخفاء أو تدمير المثلث
            Destroy(gameObject);
        }
    }
}
