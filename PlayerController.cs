using UnityEngine;

public class PlayerController : MonoBehaviour
{
    public float baseSpeed = 10f;
    public float jumpForce = 5f;
    public LayerMask groundLayer;
    
    private Rigidbody rb;
    private bool isGrounded;
    private float currentSpeed;

    void Start()
    {
        rb = GetComponent<Rigidbody>();
        currentSpeed = baseSpeed;
    }

    void Update()
    {
        // التحقق من اللمس للأرض للقفز
        isGrounded = Physics.CheckSphere(transform.position, 0.2f, groundLayer);

        if (Input.GetButtonDown("Jump") && isGrounded)
        {
            rb.AddForce(Vector3.up * jumpForce, ForceMode.Impulse);
        }
    }

    void FixedUpdate()
    {
        // حركة الكرة للأمام دائماً
        rb.MovePosition(transform.position + Vector3.forward * currentSpeed * Time.deltaTime);
        
        // تحكم بسيط يمين/يسار لتعديل المسار
        float moveHorizontal = Input.GetAxis("Horizontal");
        rb.MovePosition(transform.position + Vector3.right * moveHorizontal * 5f * Time.deltaTime);
    }

    // دالة لاستدعائها من ملف GameManager لزيادة السرعة
    public void IncreaseSpeed(float percentage)
    {
        currentSpeed += currentSpeed * (percentage / 100f);
    }
}
