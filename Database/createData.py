import csv
import random

random.seed(a=None, version=2)
# implement merge sort
generated_plan_ids = set()
with open("dataSeed.csv", "a", newline='') as f:
    csv_writer = csv.writer(f)

    for x in range(500):
        while True:
            plan_id = random.sample(range(10000, 40001), 1)[0]
            if plan_id not in generated_plan_ids:
                generated_plan_ids.add(plan_id)
                break

        overall_sqft = random.randint(1000, 10000)
        length = str(random.randint(10, 1000)) + '\'' + str(random.randint(0, 11)) + '"'
        width = str(random.randint(10, 1000)) + '\'' + str(random.randint(0, 11)) + '"'
        height = str(random.randint(10, 1000)) + '\'' + str(random.randint(0, 11)) + '"'
        num_floors = random.randint(1, 70)

        csv_writer.writerow([plan_id, overall_sqft, length, width, height, num_floors])